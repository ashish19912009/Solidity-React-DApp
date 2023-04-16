import React, { useState } from "react";
import { Navbar, Welcome, Footer, Services, LotteryList } from "./components";
import AdminHomePage from "./pages/admin/main";
import GamesHomePage from "./pages/games/main";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LotteryProvider } from "./context/lotteryContext";
import UserProvider from "./context/userContext";

const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/" element={<GamesHomePage />} />
          </Routes>
        </UserProvider>
        <LotteryProvider>
          <Routes>
            <Route path="/admin" element={<AdminHomePage />} />
          </Routes>
        </LotteryProvider>
      </BrowserRouter>
    </React.Fragment>
  );
};

export default App;
