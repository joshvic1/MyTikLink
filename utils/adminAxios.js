import axios from 'axios';
import {apiBase} from '@/components/control/api';
// The same-origin BFF reads the HttpOnly Inbox session and enforces Super Admin authority.
export default axios.create({baseURL:apiBase()});
