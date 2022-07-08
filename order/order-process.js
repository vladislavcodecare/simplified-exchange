const {
	UPDATING_DB_STATE_SINCE_THERE_ARE_NO_MATCHES,
	INITIAL_ORDER,
	GET_ORDER_STATE,
	LOCK_ORDER,
	UPDATE_ORDER,
	VERIFY_TRANSACTION,
	UNKNOWN_MESSAGE,
} = require('../utils/constraints');

const updateOrder = db => (match, order) => {
	if (match.amount > db[order.id].amount) {
		db[match.id] = {
			...db[match.id],
			amount: db[match.id].amount - db[order.id].amount,
			lock: false,
			lockedBy: undefined,
		};

		delete db[order.id];
	} else if (match.amount === db[order.id].amount) {
		delete db[order.id];
		delete db[match.id];
	} else {
		db[order.id] = {
			...db[order.id],
			amount: db[order.id].amount - db[match.id].amount,
			lock: false,
			lockedBy: undefined,
		};

		delete db[match.id];
	}
	return { updatedMatch: db[match.id], updatedOrder: db[order.id] };
};

const normalizeOrders = ({ match, order, updatedMatch, updatedOrder }, db) => {
	if (!updatedMatch) {
		delete db[match.id];
	}

	if (!updatedOrder) {
		delete db[order.id];
	}

	if (updatedMatch) {
		db[match.id] = updatedMatch;
	}

	if (updatedOrder) {
		db[order.id] = updatedOrder;
	}

	return db;
};

const unlockOrder = db => order => {
	db[order.id].lock = false;
	db[order.id].lockedBy = undefined;
};

const asyncHandlers = db => (message, responder) => {
	switch (message.type) {
		case UPDATING_DB_STATE_SINCE_THERE_ARE_NO_MATCHES:
			db = message.data;
			break;
		case INITIAL_ORDER:
			db[message.data.id] = message.data;
			break;
		case GET_ORDER_STATE:
			responder(null, { db });
			break;
		case LOCK_ORDER:
			if (db[message.data.id].lock) {
				responder(null, { success: false });
				return;
			}
			db[message.data.id].lock = true;
			db[message.data.id].lockedBy = message.data.lockedBy;
			responder(null, { success: true });
			break;
		case UPDATE_ORDER:
			db = normalizeOrders(message.data, db);

			console.log('Some transactions was made, database updated!');
			break;
		case VERIFY_TRANSACTION:
			responder(null, {
				success: db[message.data.orderId].lockedBy === db[message.data.matchedId].lockedBy,
			});
			break;
		default:
			console.log(UNKNOWN_MESSAGE, message);
	}
};

module.exports = db => {
	return {
		updateOrder: updateOrder(db),
		asyncHandlers: asyncHandlers(db),
		unlockOrder: unlockOrder(db),
	};
};
