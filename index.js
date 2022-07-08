const { PeerRPCServer, PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');

const matcher = require('./order/order-match');
const processor = require('./order/order-process');
const { Order } = require('./order/order-schema');
const { prompt } = require('./utils/prompt');
const {
	GRAPE_URL,
	EXCHANGE_SERVER,
	GET_ORDER_STATE,
	IS_FINISHED,
	GET_ORDERS,
	UPDATE_ORDER,
} = require('./utils/constraints');

let db = {};

const { asyncHandlers } = processor(db);

const serverLink = new Link({
	grape: GRAPE_URL,
});

serverLink.start();

const peerServer = new PeerRPCServer(serverLink, {
	timeout: 300000,
});
peerServer.init();

const port = 1024 + Math.floor(Math.random() * 1000);

const service = peerServer.transport('server');
service.listen(port);

setInterval(function () {
	serverLink.announce(EXCHANGE_SERVER, service.port, {});
}, 1000);

const clientLink = new Link({
	grape: GRAPE_URL,
});

clientLink.start();

const peerClient = new PeerRPCClient(clientLink, {});
peerClient.init();

service.on('request', (rid, key, payload, handler) => {
	if (payload.orderedBy === port && payload.type !== UPDATE_ORDER) return;
	asyncHandlers(payload, handler.reply);
});

console.log('User', port);

// Get current order state from active instances
const getCurrentOrders = async () => {
	peerClient.map(
		EXCHANGE_SERVER,
		{
			type: GET_ORDER_STATE,
			from: port,
		},
		{ timeout: 10000 },
		(err, data) => {
			if (data && data.length && data[0]) {
				const random = Math.floor(Math.random() * data.length);

				console.log('\nCurrent orders:', data[random].db);

				db = Object.assign(db, { ...data[random].db });
			}
		},
	);
};

getCurrentOrders();

const trade = async () => {
	try {
		const inputData = await prompt();

		if (inputData.type === GET_ORDERS) {
			await getCurrentOrders();
		}

		if ((inputData.type === 'buy' || inputData.type === 'sell') && inputData.amount) {
			await getCurrentOrders();

			const matchOrder = matcher(db, port);

			await matchOrder(
				new Order({
					type: inputData.type,
					amount: inputData.amount,
					orderedBy: port,
				}),
				peerClient,
			);
		}

		if (!inputData[IS_FINISHED]) {
			trade();
		}
	} catch (error) {
		console.error(error);
	}
};

trade();
