import React, { useContext } from "react";
import { UserContext } from "../context/userContext";

const getTicketStatus = (status) => {
  if(status === 0) {
    return 'New'
  }
  else if(status === 1) {
    return 'Open'
  }
  else if(status === 2) {
    return 'Closed';
  }
  else if(status === 3) {
    return 'Drawn';
  }
  else {
    'Not Known';
  }
}

const TransactionCard = ({
  lotteryID,
  lotteryName,
  startDateTime,
  endDateTime,
  drawDateTime,
  ticketPrice,
  ticketStatus,
  totalCollection,
  buyLottery
}) => (
  <div
    className="bg-[#181918] m-4 flex flex-1
        2xl:min-w-[450px]
        2xl:max-w-[500px]
        sm:min-w-[270px]
        sm:max-w-[300px]
        flex-col p-3 rounded-md hover:shadow-2xl
    "
  >
    <div className="flex flex-col items-center w-full mt-3">
      <div className="w-full mb-6 p-2">
        <a
          href={`https://goerli.etherscan.io/address${lotteryID}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-white text-base">
            Lottery ID: {lotteryID}
          </p>
        </a>
        <a
          href={`https://goerli.etherscan.io/address${lotteryID}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-white text-base">
            Name: {lotteryName}
          </p>
        </a>
        <p className="flex text-white text-base">Ticket Price: {ticketPrice} 'Ether'</p>
        <p className="flex text-white text-base">Lottery End Date: {endDateTime} </p>
        <p className="flex text-white text-base">Lottery Draw Date: {drawDateTime} </p>
        {totalCollection !== 0 && (
          <React.Fragment>
            <br />
            <p className="text-white text-base">Total Collection: {totalCollection}</p>
          </React.Fragment>
        )}
        <div className="bg-black p-3 px-5 w-max rounded-3xl mt-5 shadow-2xl">
          <p className="text-[#37c7da] font-bold">Starts On: {startDateTime}</p>
        </div>
        <div className="bg-black p-3 px-5 w-max rounded-3xl mt-5 shadow-2xl">
          <p className="text-[#37c7da] font-bold">Ticket Status: {getTicketStatus(ticketStatus)}</p>
        </div>
        {
          ticketStatus === 1 && <div className="bg-black p-3 px-5 w-max rounded-3xl mt-5 shadow-2xl">
          <button
                    className='text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer'
                    type="button" 
                    onClick={()=> buyLottery(lotteryID,ticketPrice)}>
                        Buy Lottery
                    </button>
        </div>
        }
        
      </div>
    </div>
  </div>
);

const LotteryListUser = () => {
  const {lotteryList, buyLottery} = useContext(UserContext);
  return (
    <div className="flex w-full jusitfy-center items-center 2xl:px-20 gradient-bg-transactions">
      <div className="flex flex-col md:p-12 py-12 px-4">
        {/* Latest Transactions */}
        <h3 className="text-white text-3xl text-center my-2">
            All Open Lotteries
        </h3>
        <div className="flex flex-wrap justify-center items-center mt-10">
          {lotteryList.reverse().map((trans, index) => (
            <TransactionCard key={index} {...trans} buyLottery={buyLottery} />
          ))}
        </div> 
      </div>
    </div>
  );
};

export default LotteryListUser;
