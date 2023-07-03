import type Koa from 'koa';

export interface AppContext {

}

export interface AppState {

}

export interface KoaContext<Body = unknown> extends Koa.ParameterizedContext<AppContext, AppState, Body> {

}
