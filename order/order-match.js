const { orderTypes } = require('./order-schema');
const { sendMessageWithClient } = require('../utils/utils');
const { col } = require('../utils/colorize');
const {
	UPDATING_DB_STATE_SINCE_THERE_ARE_NO_MATCHES,
	INITIAL_ORDER,
	LOCK_ORDER,
	UPDATE_ORDER,
	VERIFY_TRANSACTION,
	NO_MATCHES_FOUND,
	MATCHES_FOUND,
	PROCESSING,
} = require('../utils/constraints');

const findMatches = (order, db) => {
	const matchType = orderTypes.reverseOrderType(order.type);
	const orderAmount = order.amount;

	let matches = [];

	for (const key in db) {
		/**
		 * Check for three possible conditions:
		 *  - Order match type is the same (buy & buy || sell & sell)
		 *  - The owner of the transaction is not matched to his own orders
		 *  - The order is locked
		 * 	if they are met, we are not making the trade
		 */
		if (db[key].type !== matchType || db[key].orderedBy === order.orderedBy || db[key].lock) {
			continue;
		}

		// If order amount <= match amount
		// We will run out of cash
		// So we set amount back to inital state and return
		if (order.amount <= db[key].amount) {
			match = { ...db[key] };
			matches.push(match);
			order.amount = orderAmount;
			return matches;
		}

		// If we still have cash left === continue
		if (order.amount > db[key].amount) {
			match = { ...db[key] };
			matches.push(match);
			order.amount -= match.amount;
		}
	}

	// when we are done set order amount back to inital state
	order.amount = orderAmount;
	return matches;
};

module.exports = (db = {}, orderedBy = 0) => {
	const orderProcessor = require('./order-process')(db);

	return async (order, peerClient) => {
		db[order.id] = order;

		const sendMessageToAllClients = sendMessageWithClient(peerClient);

		await sendMessageToAllClients({
			type: INITIAL_ORDER,
			data: order,
			orderedBy,
		});

		const matches = findMatches(order, db);

		if (!matches.length) {
			console.log(col.magenta(NO_MATCHES_FOUND));
			orderProcessor.unlockOrder(order);
			await sendMessageToAllClients({
				type: UPDATING_DB_STATE_SINCE_THERE_ARE_NO_MATCHES,
				data: { ...db },
			});
			return;
		}

		console.log(col.green(MATCHES_FOUND), matches);
		console.log(col.cyan(PROCESSING));

		for (let i = 0; i < matches.length; i++) {
			await sendMessageToAllClients({
				type: LOCK_ORDER,
				data: { ...matches[i], lockedBy: order.orderedBy },
				orderedBy,
			});

			await sendMessageToAllClients({
				type: VERIFY_TRANSACTION,
				data: { orderId: order.id, matchedId: matches[i].id },
				orderedBy,
			});

			const { updatedMatch, updatedOrder } = orderProcessor.updateOrder(matches[i], order);

			await sendMessageToAllClients({
				type: UPDATE_ORDER,
				data: {
					match: matches[i],
					order,
					updatedMatch,
					updatedOrder,
				},
				orderedBy,
			});
		}

		console.log(col.yellow('Current DB state:'), db);
	};
};
