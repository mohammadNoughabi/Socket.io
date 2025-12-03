import AppRouter from "./routes/AppRouter";
import { validateTokenAsync } from "./store/Auth/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(validateTokenAsync());
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
