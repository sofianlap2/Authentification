import React,{useContext, useState} from 'react'
import axios from 'axios'
import AuthContext from '../../context/AuthContext'
import { useHistory } from 'react-router'

const Login = () => {

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

    const history = useHistory( )

    const {getLoggedIn} = useContext(AuthContext);

    async function login(e) {
        e.preventDefault();
        try {
            const loginData = {
                email, password 
            };
            await axios.post("http://localhost:5000/auth/login", loginData);
            await getLoggedIn();
            history.push("/");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div>
            <h1>Login to your  account</h1>
            <form onSubmit={login}>
                <input 
                type="email" 
                placeholder="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                />
                <input 
                type="password" 
                placeholder="password"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login
