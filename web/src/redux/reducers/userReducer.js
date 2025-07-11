const initialState = {
  user: null,
  devices: [],
  error: null,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        devices: action.payload.devices,
        error: null,
      };
    default:
      return state;
  }
};
