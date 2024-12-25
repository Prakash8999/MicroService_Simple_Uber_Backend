const jwt = require('jsonwebtoken');
const axios = require('axios');


module.exports.userAuth = async (req, res, next) => {
    try {
        const token =  req.headers.authorization.split(' ')[ 1 ];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded user ", decoded)

        const response = await axios.get(`http://localhost:3000/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const user = response.data;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        next();

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

module.exports.captainAuth = async (req, res, next) => {
    try {
        const token =  req.headers.authorization.split(' ')[ 1 ];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        console.log("token ride ", token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log("decoded ride ", decoded)

        const response = await axios.get(`http://localhost:3000/captain/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const captain = response.data;

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.captain = captain;

        next();

    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message });
    }
}