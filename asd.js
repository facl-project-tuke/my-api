const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Хешированный пароль:', hashedPassword);
    } catch (error) {
        console.error('Ошибка при хешировании пароля:', error);
    }
}

// Замените 'your_password_here' на пароль, который хотите хешировать
hashPassword('name');
