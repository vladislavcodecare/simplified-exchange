- Run 'npm i -g grenache-grape'

- Run 'npm install'

## Start the grape server using :

    grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
    grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

## start multiple instances with "npm start"

You will be prompted with actions: buy, sell or get orders
After that you will be asked if you are done, if you chose "no", you will be prompted again

Create some buy and sell orders on different instances to make trades

Notes:

- Trading implementation is very basic (there is no price or anything)
- App currently have a poor error handling
- There can still be issues with getting updated data after some successfull transactions (did not had enough time to debug)
- Also since its a CLI implementation there can be some bugs with prompt
