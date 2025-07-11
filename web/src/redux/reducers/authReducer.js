const initialState = {
  user: null,
  isAuthenticated: false,
  token: null,
  error: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        user: action.payload,
        token: action.payload,
        isAuthenticated: action.payload,
        error: null,
      };
    default:
      return state;
  }
};
