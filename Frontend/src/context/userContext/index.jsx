import React,{useContext, useState, useEffect} from 'react';
import {ethers} from 'ethers';
import web3 from 'web3';

import {contractABI, contractAddress} from '../../utils/constants';

export const UserContext = React.createContext();

const {ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const lotteryContract = new ethers.Contract(contractAddress, contractABI, signer);

    // console.log({
    //     provider,
    //     signer,
    //     lotteryContract
    // });
    return lotteryContract;
}

const UserProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [formData, setFormData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [lotteryList, setLotteryList] = useState([]);

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum)   return alert("Please install metamask");

        const accounts = await ethereum.request({method: 'eth_accounts'});
        setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    }

    const CheckIfAddressRegistered = async () => {
        try {
          if(!ethereum) return alert("Please install metamask");

          const contract = getEthereumContract();
          const getUserDetails = await contract.getParticipantDetails();
          if(getUserDetails[0] !== ''){
            setIsUserRegistered(true);
          }
          // console.log("getUserDetails",getUserDetails);
        } catch (error) {
            console.error(error);
        }
    }

    const userSignup = async() => {
        let {userName, age, mobileNo} = formData;
        // console.log("formData",formData);
        const contract = getEthereumContract();
        setIsLoading(true);
        const contractResponse = await contract.addNewParticipant(userName, age, mobileNo);
        setIsLoading(false);
        // console.log("Response", contractResponse); 
    }

    const connectWallet = async () => {
       try {
            if(!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({method:'eth_requestAccounts'})
            if(accounts.length){
                console.log("selected account is ", accounts[0]);
            }
            else {
                console.log("No account found");
            }

       } catch (error) {
            console.error(error);
       } 
    }

    const handleChange = (e,name) => {
        setFormData((prevData) => ({...prevData,[name]: e.target.value}));
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

    const getLotteryDetails = async (_id) => {
        try {
            const contract = getEthereumContract();
            const lotteryDetails = await contract.allLottery(_id);
            return lotteryDetails;
            // console.log("lotteryDetails",lotteryDetails);
        } catch (error) {
            console.error(error);
        }
    }

    const getAllLottery = async () => {
        console.log("test");
        try {
            const contract = getEthereumContract();
            const response = await contract.activeTickets(1);
           // console.log("Lottery Details",response);
        } catch (error) {
            console.error(error);
        }
    }

    const structureLotteryList = (arr) => {
        const temp = arr.map((el,i)=> {
            return parseInt(el._hex);
        });
        return temp;
    }

    const getAllOpenLottery = async () => {
        try{
            const newLotteryList = [];

            const lotteryContract = getEthereumContract();
            const arrList = await lotteryContract.getAllActiveLotteryArrayList();
            const lotteryList = structureLotteryList(arrList);
            
            for(let i = 0; i < lotteryList.length; i++) {
                const lotteryData = await getLotteryDetails(lotteryList[i]);
                const structuredData = structureLotteryData(lotteryData);
                if(structuredData.ticketStatus === 1){
                    newLotteryList.push(structuredData);
                }
            }
            setLotteryList(newLotteryList);
        }
        catch(error) {
            console.error(error);
            throw new Error("No Ethereum object");
        }
    }

    const buyLottery = async (lotteryID, ticketPrice) => {
        try {
        const contract = getEthereumContract();
        const toString = '' + ticketPrice;
        const price = web3.utils.toWei(toString,"ether");
        const transHash = await contract.buyLottery(lotteryID,{value:price});
        console.log("trans hash", transHash);
        } catch (error) {
            console.log("Something went wrong");
        }
    }

    useEffect(()=>{
        if(currentAccount !== ''){
            CheckIfAddressRegistered();    
        }
    },[currentAccount]);

    useEffect(()=>{
        if(isUserRegistered){
            //getAllLottery();  
        }
    },[isUserRegistered]);

    useEffect(()=>{
        checkIfWalletIsConnected();
        getAllOpenLottery();
    },[])

    return(<UserContext.Provider value={{isUserRegistered, userSignup, currentAccount, connectWallet, handleChange, isLoading, formData, lotteryList, buyLottery}}>
        {children}
        </UserContext.Provider>);
};

export default UserProvider;