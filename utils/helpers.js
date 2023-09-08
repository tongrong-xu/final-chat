// helpers.js
const generateRoomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 定義可用的字母和數字字符
    let code = "";
    for (let i = 0; i < 6; i++) { // 生成6位教室代碼
        code += characters.charAt(Math.floor(Math.random() * characters.length)); // 隨機選取一個字符並添加到代碼中
    }
    return code; // 返回生成的教室代碼
};

module.exports = {
    generateRoomCode, // 匯出 generateRoomCode 函式
};