// dispatchHelper.js
import {useDispatch} from 'react-redux';
import {setUser} from '../store/slices/user';

export const handleUnauthorizedError = async () => {
  const dispatch = useDispatch();
  dispatch(setUser(null));
};
