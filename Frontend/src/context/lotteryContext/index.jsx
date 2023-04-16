import React, {useEffect, useState} from 'react';

import {ethers} from 'ethers';

import {contractABI, contractAddress} from '../../utils/constants';

export const LotteryContext = React.createContext();

const {ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const ownerContract = new ethers.Contract(contractAddress, contractABI, signer);
    //console.log("Signerrr", signer);
    return ownerContract;
}

export const LotteryProvider = ({children}) => {

    const [currentAccount, setCurrentAccounts]= useState();
    const [formData, setFromData] = useState({lotteryName:'', startDate:'', endDate:'', drawDate:'', ticketPrice:''});
    const [isLoading, setLoading] = useState(false);
    const [isOwnerAccount, setOwnerAccount] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transaction, setTransaction] = useState([]);

    const [lotteryList, setLotteryList] = useState([]);
    const [endedLotteryList, setEndedLotteryList] = useState([]);

    const handleChange = (e, name)=> {
        setFromData((prevState)=>({...prevState,[name]:e.target.value}));  
    }
    useEffect(()=>{
        // console.log("Form Data", formData);
    },[formData])

    const getAllTransactions = async () => {
        try{
            if(!ethereum)
                return alert("Please install metamask"); 
            const transactionContract = getEthereumContract();
            const allTransactions = await transactionContract.getAllTransactions();
            const structedTransaction = allTransactions.map((transaction)=>({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
            setTransaction(structedTransaction);
           // console.log("All Transaction", structedTransaction);
        }
        catch(error) {
            console.log("Something went wrong");
        }

    }

    const checkIfWalletIsConnected = async () => {
        try{
        if(!ethereum) {
            return alert("Please install metamask"); 
        }
        const accounts = await ethereum.request({method:'eth_accounts'});
        if(accounts.length){
            setCurrentAccounts(accounts[0])
            getAllTransactions();
        }
        else {
            console.log("No account found");
        }

        }
        catch(error){
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const structureLotteryList = (arr) => {
        const temp = arr.map((el,i)=> {
            return parseInt(el._hex);
        });
        return temp;
    }

    const getDateTimeFormat = (dateTime) => {
        const temp = new Date(parseInt(dateTime) * 1000);
        const newDateTime = `${temp.getMonth()+1}/${temp.getDate()}/${temp.getFullYear()} - ${temp.getHours()}:${temp.getMinutes()}`
        return newDateTime;
    }

    const structureLotteryData = (data) => {
        const tempStringPrice = parseInt(data.ticketPrice._hex) + "";
        const temp = {
            lotteryID: parseInt(data.lottery_ID._hex),
            lotteryName: data.lootName,
            startDateTime: getDateTimeFormat(data.startDateTime),
            endDateTime: getDateTimeFormat(data.endDateTime),
            drawDateTime: getDateTimeFormat(data.drawDateTime),
            ticketPrice:  ethers.utils.formatEther(tempStringPrice),
            ticketStatus: data.status,
            totalCollection: parseInt(data.totalCollection)
        }
        return temp;
    }

    const getAllLottery = async () => {
        try{
            const newLotteryList = [];

            const lotteryContract = getEthereumContract();
            const test = await lotteryContract.getAllActiveLotteryArrayList();
            const lotteryList = structureLotteryList(test);
            
            for(let i = 0; i < lotteryList.length; i++) {
                const lotteryData = await getLotteryDetails(lotteryList[i]);
                const structuredData = structureLotteryData(lotteryData);
                if(structuredData.lotteryID !== 0)
                    newLotteryList.push(structuredData);
            }
            console.log("newLotteryList",newLotteryList);
            setLotteryList(newLotteryList);

        }
        catch(error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const getAllEndedLottery = async () => {
        try{
            const newLotteryList = [];

            const lotteryContract = getEthereumContract();
            const list = await lotteryContract.getAllEndedLotteryArrayList();
            const lotteryList = structureLotteryList(list);
            
            for(let i = 0; i < lotteryList.length; i++) {
                const lotteryData = await getLotteryDetails(lotteryList[i]);
                const structuredData = structureLotteryData(lotteryData);
                if(structuredData.lotteryID !== 0)
                    newLotteryList.push(structuredData);
            }
            setEndedLotteryList(newLotteryList);

        }
        catch(error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const getLotteryDetails = async (_id) => {
        try {
            const contract = getEthereumContract();
            const lotteryDetails = await contract.allLottery(_id);
            return lotteryDetails;
        } catch (error) {
            console.error(error);
        }
    }

    const checkIfOwnerAccount = async() => {
        try {
            const ownerContract = getEthereumContract();
            const ifIsOwner = await ownerContract.checkIfOwnerAccount();
            console.log("ifIsOwner",ifIsOwner);
            setOwnerAccount(ifIsOwner);
        } catch (error) {
            console.error(error);
            throw new Error("No Ether object");
        }
    }

    useEffect(()=>{
        //console.log("is owner account", isOwnerAccount);
    },[isOwnerAccount]);

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfOwnerAccount();
        getAllLottery();
        getAllEndedLottery();
        //checkIfTransactionExist();
    },[]);

    const connectWallet = async () => {
        try {
            if(!ethereum) {
                return alert("Please install metamask"); 
            }
            const accounts = await ethereum.request({method:'eth_requestAccounts'});
            if(accounts.length){
                setCurrentAccounts(accounts[0]);

                // getAllTransactions();
            }else {
                console.log("No Account Found");
            }
        }
        catch(error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const getTimeStamp = (dt) => {
       let date = new Date(dt); 
       let getTime = date.getTime();
       getTime = Math.floor(getTime/1000);
       return getTime;
    }
    const creatLotteryTicket = async () => {
        try {
            if(!ethereum) {
                return alert("Please install metamask"); 
            }
            let {lotteryName, startDate,endDate,drawDate,ticketPrice} = formData;
            const transactionContract = getEthereumContract();
            startDate = getTimeStamp(startDate);
            endDate = getTimeStamp(endDate);
            drawDate = getTimeStamp(drawDate);
            const transHash = await transactionContract.createNewLottery(lotteryName, startDate, endDate, drawDate, ethers.utils.parseEther(ticketPrice.toString()));
            setLoading(true);
            await transHash.wait();
            setLoading(false);
            setFromData({lotteryName:'', startDate:'', endDate:'', drawDate:'', ticketPrice:''});
        }
        catch(error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const registerUser = async() => {
        try {
            if(!ethereum){
                return alert("Please install metamask");
            }
        } catch (error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const updateTicketStatus = async(lotteryID, type) => {
        try {
            if(!ethereum){
                return alert("Please install metamask");
            }
            const trasnactionContract = getEthereumContract();
            if(type === 'open'){
                const transHash = await trasnactionContract.updateLotteryToActive(lotteryID);
            }
            else if(type === 'end'){
                const transHash = await trasnactionContract.endLottery(lotteryID);
            }
            if(type === 'draw'){
                const transHash = await trasnactionContract.lotteryLuckyDraw(lotteryID);
                console.log("transHash",transHash);
            }
            // console.log("transHash", transHash);
        } catch (error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }
    
    return (
        <LotteryContext.Provider value={{connectWallet, currentAccount, formData, creatLotteryTicket, registerUser, handleChange, isLoading, transaction, isOwnerAccount, lotteryList, endedLotteryList, updateTicketStatus}}>
            {children}
        </LotteryContext.Provider>
    )
}