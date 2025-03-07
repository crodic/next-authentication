export type LoginResponseData = {
    accessToken: string;
    refreshToken: string;
    user: {
        username: string;
        id: number;
        password: string;
    };
};

export type User = {
    id: number;
    username: string;
    password: string;
};
