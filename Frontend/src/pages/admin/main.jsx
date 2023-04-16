import React, { useState, useContext, useEffect } from 'react';
import {Navbar, WelcomAdmin, Footer, Services, LotteryList } from '../../components';
import {LotteryContext} from '../../context/lotteryContext';
import {useNavigate} from 'react-router-dom';

const App = () => {

  const {isOwnerAccount} = useContext(LotteryContext);
  console.log("isOwnerAccount", isOwnerAccount);
  const navigate = useNavigate();
  useEffect(()=>{
   if(!isOwnerAccount){
    navigate("/");
   }
  },[isOwnerAccount])
  if(isOwnerAccount){
    return (
      <React.Fragment>
      <div className="min-h-screen">
      <div className='gradient-bg-welcome'>
      <Navbar/>
      <WelcomAdmin />
    </div>
    <LotteryList/>
    <Footer/>
      </div>
      </React.Fragment>
    )
  }
}

export default App
