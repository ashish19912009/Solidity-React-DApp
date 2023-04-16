import React, { useState } from 'react';
import {Navbar, Welcome, Footer, Services, LotteryList} from '../../components';
import LotteryL from '../../components/LotteryListUser';

const App = () => {

  return (
    <React.Fragment>
    <div className="min-h-screen">
      <div className='gradient-bg-welcome'>
        <Navbar/>
        <Welcome formType={'user_signup'}/>
      </div>
      <Services/>
    <LotteryL/>
      <Footer/>
    </div>
    </React.Fragment>
  )
}

export default App
