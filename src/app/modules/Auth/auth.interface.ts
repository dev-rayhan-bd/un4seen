export type TLoginUser={
    email:string;
    password:string;
    fcmToken?:string  // optional - app sends on login
}
export type TLoginAdmin={
    email:string;
    password:string;

}

