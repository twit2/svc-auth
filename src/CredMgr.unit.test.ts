import './CredMgr.test';

jest.mock('./CredStore', ()=>({
    ...jest.requireActual('./CredStore'),
    CredStore: require('./CredStore.mock').CredStoreMock
}));