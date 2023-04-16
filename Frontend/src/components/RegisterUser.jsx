import React,{useContext} from 'react';
import {LotteryContext} from '../context/lotteryContext';
import Loader from './Loader';

const Input = ({placeholder, name, type, value, handleChange}) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        value={value}
        onChange={(e)=> handleChange(e,name)}
        className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism"
    />
)

const registerUser = () => {
    const {formData, registerUser, handleChange, isLoading} = useContext(LotteryContext);

    const onSubmit = (e) => {
      const {name, age, mobileNo} = formData; 
      e.preventDefault();

      if(!name || !age || !mobileNo){
        alert("Please enter all details")
      }

      registerUser();
    }
    return (
        <div className='flex w-full justify-center items-center'>
            <div className='flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
              
             <div className='flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10'>
                
             <h3 className='text-2xl sm:text-5xl text-white py-3'>Register to Play</h3>
                <div className='p-5 sw:w-96 w-full flex flex-col justify-start items-cetner blue-glassmorphism'>
                    <Input placeholder='Participant Name' name="name" type="text" handleChange={handleChange} />
                    <Input placeholder='Age' name="age" type="number" handleChange={handleChange} />
                    <Input placeholder='mobileNo' name="mobileNo" type="number" handleChange={handleChange} />

                    <div className='h-[1px] w-full bg-gray-400 my-2' />
                    {isLoading ? (<Loader/>) : (
                    <button
                    className='text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer'
                    type="button" 
                    onClick={onSubmit}>
                        Register Now
                    </button>)}
                </div>  

            </div>
            </div>
        </div>
    )
}

export default registerUser;