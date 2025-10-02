export interface Application {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	experience: string;
	available_days: string[];
	message: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface CreateApplicationData {
	name: string;
	email: string;
	phone?: string;
	experience: string;
	available_days: string[];
	message?: string;
}
