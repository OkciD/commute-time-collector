declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV: 'production' | 'dev';
	}
}

export interface BuildRouteResponse {
	data: RoutesData;
}

export type TransportType = 'comparison' | 'auto' | 'masstransit' | 'pedestrian' | 'bicycle' | 'taxi';

export interface RoutesData {
	routes: Array<AutoRoute>;
	waypoints: Array<{
		request: [number, number];
		coordinates: [number, number];
		index: number;
	}>;
	type: TransportType;
	viaIndexes: Array<unknown>;
}

export interface AutoRoute {
	uuid: string;
	type: TransportType;
	paths: Array<unknown>;
	refPointsLineCoordinates: Array<[number, number]>;
	constructions: Array<unknown>;
	distance: {
		value: number;
		test: string;
	};
	duration: {
		value: number;
		test: string;
	};
	durationInTraffic: {
		value: number;
		test: string;
	};
	bounds: Array<[number, number]>;
	encodedCoordinates: string;
	flags: {
		blocked: boolean;
		hasTolls: boolean; // есть ли платные дороги
		hasFerries: boolean;
		crossesBorders: boolean;
		requiresAccessPass: boolean;
		futureBlocked: boolean;
		deadJam: boolean;
		hasRuggedRoads: boolean;
	}
	colorizeInfo: Array<{ count: number; type: string; }>;
	matchFilter: boolean;
}

export interface FilteredAutoRoute {
	uuid: AutoRoute['uuid'],
	distance: AutoRoute['distance']['value'],
	duration: AutoRoute['duration']['value'],
	durationInTraffic: AutoRoute['durationInTraffic']['value'],
	flags: Pick<AutoRoute['flags'], 'blocked' | 'hasTolls' | 'futureBlocked' | 'deadJam'>,
}
