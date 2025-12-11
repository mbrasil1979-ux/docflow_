import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface State {
  userInput: string;
  loading: boolean;
  result: string | null;
}

const initialState: State = {
  userInput: "",
  loading: false,
  result: null,
};

type Action =
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_RESULT"; payload: string | null }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, userInput: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_RESULT":
      return { ...state, result: action.payload };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => {},
});

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
