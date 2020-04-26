export enum ErrorCode {
	Redirect = 'REDIRECT',
	ConfigViewNotFound = 'CONFIG_VIEW_NOT_FOUND',
	torRequestStatusCodeError = 'TOR_REQUEST_STATUS_CODE_ERROR',
	torRequestError = 'TOR_REQUEST_ERROR',
}

export default class CustomError extends Error {
	public code: ErrorCode;
	public data: any;

	constructor(code: ErrorCode, message: string, data?: any) {
		super(message);
		this.code = code;
		this.data = data;
	}
}
