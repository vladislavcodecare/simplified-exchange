const inquirer = require('inquirer');

const { orderTypes } = require('../order/order-schema');
const {
	NOT_A_NUMBER,
	MUST_BE_GREATER_THAN_ZERO,
	NUMBER_TO_HIGH,
	WHAT_WOULD_YOU_LIKE_TO_DO,
	QUANTITY,
	MIN_ACCEPTED_VALUE,
	GET_ORDERS,
	IS_FINISHED,
	ARE_YOU_DONE,
} = require('./constraints.js');

const prompt = async () => {
	const questions = [
		{
			name: 'type',
			type: 'list',
			message: WHAT_WOULD_YOU_LIKE_TO_DO,
			choices: [orderTypes.buy, orderTypes.sell, GET_ORDERS],
		},
		{
			name: 'amount',
			type: 'number',
			message: QUANTITY,
			when: answers => answers.type !== GET_ORDERS,
			validate: number => {
				if (Number.isNaN(number)) return NOT_A_NUMBER;
				if (number < MIN_ACCEPTED_VALUE) return MUST_BE_GREATER_THAN_ZERO;
				if (number > Number.MAX_SAFE_INTEGER) return NUMBER_TO_HIGH;
				return true;
			},
		},
		{
			type: 'confirm',
			name: IS_FINISHED,
			message: ARE_YOU_DONE,
		},
	];

	return await inquirer.prompt(questions);
};

module.exports = { prompt };
