
const requireLogin = (req, res, next) => {
    try {
        if (req.session.user) {
            // 使用者已經登入，繼續執行下一個中間件或路由處理函式
            next();
        } else {
            // 使用者尚未登入，重新導向到首頁
            return res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const requireLogout = (req, res, next) => {
    try {
        if (req.session.user) {
            // 使用者尚未登出，重新導向到學生或教師頁面，根據使用者的角色
            if (req.session.user.role === 'student' || req.session.user.role === 'teacher') {
                return res.redirect('/home');
            }
            // 職業未知時，重新導向到登入頁面
            return res.redirect('/');
        }
        // 使用者已經登出，繼續執行下一個中間件或路由處理函式
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isteacher = (req, res, next) => {
    try {
        if (req.session.user.role === 'teacher') {
            // 使用者已經登入且為教師，繼續執行下一個中間件或路由處理函式
            return next();
        } else {
            // 使用者未登入或非教師，重新導向到學生或教師頁面，根據使用者的角色
            return res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isstudent = (req, res, next) => {
    try {
        if (req.session.user.role === 'student') {
            // 使用者已經登入且為學生，繼續執行下一個中間件或路由處理函式
            return next();
        } else {
            // 使用者未登入或非學生，重新導向到學生或教師頁面，根據使用者的角色
            return res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    requireLogin,
    requireLogout,
    isteacher,
    isstudent,
};