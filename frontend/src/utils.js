// Universal name formatter (FIO)
export const formatName = (user) => {
    if (!user) return 'Пользователь';

    const last = user.last_name || '';
    const first = user.first_name || '';
    const mid = user.middle_name || '';

    const fullName = `${last} ${first} ${mid}`.trim();

    if (fullName) {
        return fullName;
    }

    return user.username;
};
