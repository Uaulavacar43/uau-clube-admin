class AuthError extends Error {
	constructor(
		public message: string,
		public code = 401
	) {
		super(message)
		Object.setPrototypeOf(this, AuthError.prototype)
	}
}


export default AuthError
