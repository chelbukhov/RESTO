const assert = require ('assert');              // утверждения
const ganache = require ('ganache-cli');        // тестовая сеть
const Web3 = require ('web3');                  // библиотека для подключения к ефириуму

require('events').EventEmitter.defaultMaxListeners = 0;

// старт тестов 03.09.2018
const addTimeToStart = 15; // время в днях до Start Crowdsale 20/09/2018
//const addTimeTo30may = 102; //время в днях до Finish Crowdsale 14/12/2018
//const addTimetoGreatPause = 790; // время до начала работы после паузы 01/11/2020
const crowdsaleEndTime = 85 + addTimeToStart;
const compiledContract = require('../build/Crowdsale.json');

const compiledToken = require('../build/RESTOToken.json');


let accounts;
let contractAddress;
console.log(Date());


describe('Серия тестов для проверки функций контракта ...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });
    
    it('Проверка остатка токенов на адресе teamAddress1 4.5% = 49.5 млн...', async () => {
        let myAddress = await contract.methods.teamAddress1().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 49500000);
        //console.log("teamAddress1: ", myBalance);
    });

    it('Проверка остатка токенов на адресе TeamAddress2 13.5% = 148.5 млн...', async () => {
        let myAddress = await contract.methods.teamAddress2().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 148500000);
        //console.log("teamAddress2: ", myBalance);
    });

    it('Проверка остатка токенов на адресе MarketingAddress 18% = 198 млн...', async () => {
        let myAddress = await contract.methods.marketingAddress().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 198000000);
        //console.log("MarketingAddress: ", myBalance);
    });

    it('Проверка остатка токенов на адресе RetailersAddress 9% = 99 млн...', async () => {
        let myAddress = await contract.methods.retailersAddress().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 99000000);
        //console.log("RetailersAddress: ", myBalance);
    });

    it('Проверка остатка токенов на адресе ReserveAddress 8% = 88 млн...', async () => {
        let myAddress = await contract.methods.reserveAddress().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 88000000);
        //console.log("ReserveAddress: ", myBalance);
    });

    it('Проверка остатка токенов на адресе BountyAddress 1% = 11 млн...', async () => {
        let myAddress = await contract.methods.bountyAddress().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 11000000);
        //console.log("BountyAddress: ", myBalance);
    });

    it('Проверка остатка токенов на адресе контракта crowdsale 46% = 506 млн...', async () => {
        let myBalance = await token.methods.balanceOf(contractAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 506000000);
        //console.log("crowdsale: ", myBalance);
    });

    // пополнение средств до начала краудсейла
    it('Переводим от account[2] 5 эфиров, должен отбить...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 5*10**18
            });
            assert(false);    
        } catch (error) {
            assert(error);
            //console.log(error);
        }
    });


    // установка начала PreSale
    it('Увеличиваем время в ganache-cli на addTimeToStart дней - до 20 сентября', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * addTimeToStart],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    // пополнение средств
    it('Переводим от account[2] 5 эфиров, должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });


    // проверка начисления токенов
    it('Проверка токенов на адресе accounts[2] = 5 * 1000 + бонус 100%...', async () => {

        let myBalance = await token.methods.balanceOf(accounts[2]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 10000);
        //console.log(myBalance);
    });

    it('Увеличиваем время в ganache-cli на 20 дней - до 10 октября', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 20],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    // пополнение средств
    it('Переводим от account[3] 5 эфиров, должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[3],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });


    // проверка начисления токенов
    it('Проверка токенов на адресе accounts[3] = 5 * 1000 + бонус 40%...', async () => {

        let myBalance = await token.methods.balanceOf(accounts[3]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 7000);
        //console.log(myBalance);
    });

    it('Увеличиваем время в ganache-cli на 7 дней - до 17 октября', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 7],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    // пополнение средств
    it('Переводим от account[4] 5 эфиров, должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[4],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });


    // проверка начисления токенов
    it('Проверка токенов на адресе accounts[4] = 5 * 1000 + бонус 30%...', async () => {

        let myBalance = await token.methods.balanceOf(accounts[4]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 6500);
        //console.log(myBalance);
    });

    it('Увеличиваем время в ganache-cli на 7 дней - до 24 октября', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 7],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    // пополнение средств
    it('Переводим от account[5] 5 эфиров, должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[5],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    // проверка начисления токенов
    it('Проверка токенов на адресе accounts[5] = 5 * 1000 + бонус 20%...', async () => {

        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 6000);
        //console.log(myBalance);
    });

    it('Увеличиваем время в ganache-cli на 8 дней - до 1 ноября', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 8],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    // пополнение средств
    it('Переводим от account[6] 5 эфиров, должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[6],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    // проверка начисления токенов
    it('Проверка токенов на адресе accounts[6] = 5 * 1000 + бонус 10%...', async () => {

        let myBalance = await token.methods.balanceOf(accounts[6]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 5500);
        //console.log(myBalance);
    });

    it('Увеличиваем время в ganache-cli на 20 дней - до 20 ноября', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 20],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    // пополнение средств
    it('Переводим от account[7] 5 эфиров, должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[7],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    // проверка начисления токенов
    it('Проверка токенов на адресе accounts[7] = 5 * 1000 + бонус 0%...', async () => {

        let myBalance = await token.methods.balanceOf(accounts[7]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 5000);
        //console.log(myBalance);
    });

    it('Проверка баланса на контракте перед выводом всех средств - ...', async () => {
        let accBalance = await web3.eth.getBalance(contract.options.address);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 30);
        console.log("Balance of contract before withdraw: ", accBalance);
    });
    
    it('Проверка баланса на account[0] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[0]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        //assert(accBalance < 70);
        console.log("Balance of account[0] before withdraw: ", accBalance);
    });


    it('Выводим cредства на account[0]..', async () => {
        try {
            await contract.methods.forwardFunds().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
            //console.log(error);
        }
    });

    it('Проверка баланса на account[0] после вывода средств с контракта - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[0]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 99);
        console.log("Balance of account[0] after withdraw: ", accBalance);
    });

    //передача прав собственника
    it('Передача прав собственника...', async () => {
        try {
            await contract.methods.transferOwnership(accounts[2]).send({
                from: accounts[0],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Подтверждение прав собственника...', async () => {
        try {
            await contract.methods.confirmOwnership().send({
                from: accounts[2],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Установка менеджера от нового собственника...', async () => {
        try {
            await contract.methods.setManager(accounts[3]).send({
                from: accounts[2],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });


    it('Проверка токенов на адресе accounts[5] = 6000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 6000);
        //console.log(myBalance);
    });


    //начисление токенов инвесторам
    it('Передача токенов менеджером...', async () => {
        try {
            await contract.methods.transferTokens(accounts[5], "1000000000000000000000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 6000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 7000);
        //console.log(myBalance);
    });

    it('Установка паузы от нового собсвтенника (accounts[2]...', async () => {
        try {
            await contract.methods.pauseCrowdsale().send({
                from: accounts[2],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
            //console.log(error);

        }
    });

    it('Передача токенов менеджером - должен отбить...', async () => {
        try {
            await contract.methods.transferTokens(accounts[5], "1000000000000000000000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('Снятие паузы от нового собсвтенника (accounts[2]...', async () => {
        try {
            await contract.methods.unpauseCrowdsale().send({
                from: accounts[2],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
            //console.log(error);

        }
    });

    it('Передача токенов менеджером - должен работать...', async () => {
        try {
            await contract.methods.transferTokens(accounts[5], "1000000000000000000000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 7000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 8000);
        //console.log(myBalance);
    });

    // проверка передачи токенов с зарезервированных адресов с учетом холда
    it('Передача токенов менеджером с адреса teamAddress1 - должен работать...', async () => {
        try {
            await contract.methods.transferTokensFromTeamAddress1(accounts[5], "1000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 8000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 9000);
        //console.log(myBalance);
    });

    it('Передача токенов менеджером с адреса MarketingAddress - должен работать...', async () => {
        try {
            await contract.methods.transferTokensFromMarketingAddress(accounts[5], "1000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 9000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 10000);
        //console.log(myBalance);
    });

    it('Передача токенов менеджером с адреса RetailersAddress - должен работать...', async () => {
        try {
            await contract.methods.transferTokensFromRetailersAddress(accounts[5], "1000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 10000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 11000);
        //console.log(myBalance); 
    });
            
    it('Передача токенов менеджером с адреса ReserveAddress - должен работать...', async () => {
        try {
            await contract.methods.transferTokensFromReserveAddress(accounts[5], "1000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 11000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 12000);
        //console.log(myBalance); 
    });

    it('Передача токенов менеджером с адреса BountyAddress - должен работать...', async () => {
        try {
            await contract.methods.transferTokensFromBountyAddress(accounts[5], "1000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 12000+1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 13000);
        //console.log(myBalance); 
    });
});

describe('Серия тестов для проверки холда на TeamAddress2 ...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });


    it('Передача токенов менеджером с адреса TeamAddress2 - должен отбить (холд)...', async () => {
        try {
            await contract.methods.transferTokensFromTeamAddress2(accounts[5], "1000").send({
                from: accounts[0],
                gas: "100000"
            });
            assert(false);
        } catch (error) {
            assert(error);
            //console.log(error);
        }
    }); 

    it('Увеличиваем время в ganache-cli на crowdsaleEndTime + 364 дней - один год минус 1 день от момента EndCrowdsale', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * (364 + crowdsaleEndTime)],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Передача токенов менеджером с адреса TeamAddress2 - должен отбить (холд)...', async () => {
        try {
            await contract.methods.transferTokensFromTeamAddress2(accounts[5], "1000").send({
                from: accounts[0],
                gas: "100000"
            });
            assert(false);
        } catch (error) {
            assert(error);
            //console.log(error);
        }
    }); 

    it('Проверка токенов на адресе accounts[5] = 0...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 0);
        //console.log(myBalance); 
    });

    it('Увеличиваем время в ganache-cli на 1 день - один год от момента EndCrowdsale', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Передача токенов менеджером с адреса TeamAddress2 - должен работать...', async () => {
        try {
            await contract.methods.transferTokensFromTeamAddress2(accounts[5], "1000").send({
                from: accounts[0],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
            //console.log(error);
        }
    }); 

    it('Проверка токенов на адресе accounts[5] = 1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        //assert(myBalance == 1000);
        //console.log(myBalance); 
    });

});

// штатные функции
describe('Серия тестов для проверки штатных функций ...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });

    it('Передача токенов ...', async () => {
        try {
            await contract.methods.transferTokens(accounts[5], "1000000000000000000000").send({
                from: accounts[0],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[5] = 1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[5]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 1000);
        //console.log(myBalance);
    });

    it('Проверка функции transfer...', async () => {
        try {
            await token.methods.transfer(accounts[6], "1000000000000000000000").send({
                from: accounts[5],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[6] = 1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[6]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 1000);
        //console.log(myBalance);
    });

    it('Проверка функции approve...', async () => {
        try {
            await token.methods.approve(accounts[3], "500000000000000000000").send({
                from: accounts[6],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка функции increaseApproval...', async () => {
        try {
            await token.methods.increaseApproval(accounts[3], "500000000000000000000").send({
                from: accounts[6],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка функции transferFrom и approve...', async () => {
        try {
            await token.methods.transferFrom(accounts[6], accounts[7], "1000000000000000000000").send({
                from: accounts[3],
                gas: "100000"
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка токенов на адресе accounts[7] = 1000...', async () => {
        let myBalance = await token.methods.balanceOf(accounts[7]).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 1000);
        //console.log(myBalance);
    });


});