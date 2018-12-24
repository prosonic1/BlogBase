import produce from 'immer';

interface IFormData {
  displayName: string;
  email: string;
  password: string;
}
export interface IAccountState {
  form: IFormData;
  state: {
    form: string;
    active: boolean;
    loading: boolean;
  };
}

const initFormData: IFormData = {
  displayName: '',
  email: '',
  password: '',
};

export const defaultState: IAccountState = {
  form: {
    ...initFormData,
  },
  state: {
    form: 'signin',
    active: false,
    loading: false,
  },
};

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case 'INITIALIZE_FORM_DATA':
      return produce(state, draft => {
        draft.form = initFormData
      });
    case 'CHANGE_ACCOUNT_FORM_VALUE':
      return produce(state, draft => {
        draft.form[action.name] = action.value
      });
    default:
      return state;
  }
};
