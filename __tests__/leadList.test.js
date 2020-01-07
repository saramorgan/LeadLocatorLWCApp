import { createElement } from 'lwc';
import leadList from 'c/leadList';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import searchLeads from '@salesforce/apex/LeadSearchController.searchLeads';

// Represent a list of valid records
const mockGetLeads = require('./data/getLeads.json');
// Represent a list of no records
const mockGetNoLeads = require('./data/getNoLeads.json');
// Register the Apex wire adapter
const searchLeadsAdapter = registerApexTestWireAdapter(searchLeads);

describe('c-lead-list', () => {
    beforeAll(() => {
        // Use fake timers as setTimeout
        jest.useFakeTimers();
    });

    // Best practice to cleanup after each test
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('searchLeads @wire returns records with search parameter', () => {
        it('called with data from input', () => {
            const USER_INPUT = 'Bertha';
            const SEARCH_TERM = { searchTerm: USER_INPUT };

            // Create the leadList element
            const element = createElement('c-lead-list', {
                is: leadList
            });
            document.body.appendChild(element);

            // Simulate user input
            const inputValue = element.shadowRoot.querySelector('lightning-input');
            inputValue.value = USER_INPUT;
            inputValue.dispatchEvent(new CustomEvent('change'));

            // Run the fake timers
            jest.runAllTimers();

            // Return a promise to wait for asynchronous results
            // and fail if promise is rejected
            return Promise.resolve().then(() => {
                expect(searchLeadsAdapter.getLastConfig()).toEqual(
                    SEARCH_TERM
                );
            });
        });

        it('renders data of one record', () => {
            const USER_INPUT = 'Bertha Boxer';

            // Create the leadList element
            const element = createElement('c-lead-list', {
                is: leadList
            });
            document.body.appendChild(element);
            
            // Simulate user input
            const inputValue = element.shadowRoot.querySelector('lightning-input');
            inputValue.value = USER_INPUT;
            inputValue.dispatchEvent(new CustomEvent('change'));

            // Run the fake timers
            jest.runAllTimers();

            // Use the searchLeadsAdapter to emit data
            searchLeadsAdapter.emit(mockGetLeads);

            // Return a promise to wait for asynchronous results
            // and fail if promise is rejected
            return Promise.resolve().then(() => {
                // select some elements that would be rendered if it succeeded
                const detailElement = element.shadowRoot.querySelector('lightning-datatable');
                const rows = detailElement.data;
                expect(detailElement.length).toBe(searchLeadsAdapter.length);
                expect(rows[0].Name).toBe(mockGetLeads[0].Name);
            });

        });

        it('renders data when no record is available', () => {
            const USER_INPUT = '';

            // Create the leadList element
            const element = createElement('c-lead-list', {
                is: leadList
            });
            document.body.appendChild(element);

            // Simulate user input
            const inputValue = element.shadowRoot.querySelector('lightning-input');
            inputValue.value = USER_INPUT;
            inputValue.dispatchEvent(new CustomEvent('change'));

            // Run the fake timers
            jest.runAllTimers();

            // Use the searchLeadsAdapter to emit data
            searchLeadsAdapter.emit(mockGetNoLeads);

            // Return a promise to wait for asynchronous results
            // and fail if promise is rejected
            return Promise.resolve().then(() => {
                // select some elements that would be rendered if it succeeded
                const detailElement = element.shadowRoot.querySelector('lightning-datatable');
                expect(detailElement.length).toBe(searchLeadsAdapter.length);
            });
        });

    });

    describe('searchLeads @wire returns error', () => {
        it('shows error panel', () => {
            // Create the leadList element
            const element = createElement('c-lead-list', {
                is: leadList
            });
            document.body.appendChild(element);

            // Emit error from @wire
            searchLeadsAdapter.error();

            // Return a promise to wait for any asynchronous DOM updates. Jest
            // will automatically wait for the Promise chain to complete before
            // ending the test and fail the test if the promise rejects.
            return Promise.resolve().then(() => {
                const errorPanelEl = element.shadowRoot.querySelector(
                    'c-error-panel'
                );
                expect(errorPanelEl).not.toBeNull();
            });
        });
    });

})