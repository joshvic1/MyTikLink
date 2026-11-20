import {createContext,useContext} from 'react';
import {apiRequest} from '../lib/api';
export const DesignApiContext=createContext(apiRequest);
export const useDesignApi=()=>useContext(DesignApiContext);
