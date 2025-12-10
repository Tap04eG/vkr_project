export const formatName = (user) => {
    if (!user) return 'Пользователь';

    // Student: First Name only (or Username if missing)
    if (user.role === 'student') {
        return user.first_name || user.username;
    }

    // Parent/Teacher: First Name + Middle Name (Imya Otchestvo)
    const name = user.first_name || '';
    const mid = user.middle_name || '';
    if (name || mid) {
        return `${name} ${mid}`.trim();
    }

    return user.username;
};
