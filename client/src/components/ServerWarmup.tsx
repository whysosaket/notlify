import { useState, useEffect } from "react";

const ServerWarmup = (props: { url: string }) => {
  const [isBackendUp, setIsBackendUp] = useState(false);
  const [isPromtUp, setIsPromptUp] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let intervalId: number;

    const disablePopup = ()=>{
        setTimeout(()=>{
            setIsPromptUp(false);
        },3000);
    }

    // Function to check the backend status using fetch
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(props.url);
        if (response.ok) {
          setIsBackendUp(true);
          disablePopup();
          clearInterval(intervalId);
        }
      } catch (err) {
        console.log(err);
        setIsBackendUp(false);
      }
    };

    // Set an interval to ping the backend every 5 seconds
    intervalId = setInterval(checkBackendStatus, 5000);

    return () => clearInterval(intervalId);
  }, [props.url]);

  

  return (
    isPromtUp&&
    <div className="fixed bg-gray-100 border flex z-30 border-gray-300 bottom-4 md:bottom-10 md:right-10 rounded-xl mx-4 px-6 py-4 shadow-2xl">
      {isBackendUp ? (
        <p className="text-green-600 font-semibold align-middle flex gap-2">
            <Tick />
            Backend is up!
        </p>
      ) : (
        <p className="text-red-600 font-semibold align-middle flex gap-2">
          <Spinner />
          <span className="my-auto">Warming up the server...</span>
        </p>
      )}
    </div>
  );
};

const Spinner = () => {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

const Tick = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="26"
      height="26"
      viewBox="0 0 48 48"
    >
      <path
        fill="#c8e6c9"
        d="M36,42H12c-3.314,0-6-2.686-6-6V12c0-3.314,2.686-6,6-6h24c3.314,0,6,2.686,6,6v24C42,39.314,39.314,42,36,42z"
      ></path>
      <path
        fill="#4caf50"
        d="M34.585 14.586L21.014 28.172 15.413 22.584 12.587 25.416 21.019 33.828 37.415 17.414z"
      ></path>
    </svg>
  );
};

export default ServerWarmup;