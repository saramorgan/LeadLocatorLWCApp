
import { LightningElement, track, wire} from 'lwc';
import searchLeads from '@salesforce/apex/LeadSearchController.searchLeads';
import { NavigationMixin } from 'lightning/navigation';

/** The delay used when debouncing event handlers before a method call. */
// This code was copied directly from the trailheadapps/lwc-recipes GitHub repo
const DELAY = 350;


// It is a general convention to capitalize constants
const COLS = [
    {
        label: 'Name',
        fieldName: 'Name',
        type: 'text'
    },
    {
        label: 'Title',
        fieldName: 'Title',
        type: 'text'
    },
    {
        label: 'Company',
        fieldName: 'Company',
        type: 'text'
    },
    {
        label: 'View',
        type: 'button-icon',
        initialWidth: 75,
        typeAttributes: {
            title: 'View Details',
            alternativeText: 'View Details',
            iconName: 'action:info'

        }
    }
];


export default class LeadList extends NavigationMixin(LightningElement) {
    @track leads = [];
    @track searchTerm;
    @track cols = COLS;
    @track error;

    
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        if (this.leads) {
            const selectedEvent = new CustomEvent('newsearch', {detail: this.searchTerm});
            window.clearTimeout(this.delayTimeout);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.delayTimeout = setTimeout(() => {
                this.dispatchEvent(selectedEvent);
            }, DELAY);
        }

    }

    @wire(searchLeads, {
        searchTerm: '$searchTerm'
    })
    loadLeads({ error, data }) {
        if (data) {
            this.leads = data;
            const selectedEvent = new CustomEvent('searchcomplete', {detail: this.searchTerm});
            this.dispatchEvent(selectedEvent);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.leads = undefined;
        }
    }

    handleRowAction(event) {
        const row = event.detail.row;
        this.record = row;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                actionName: 'view',
            },
        });
    }


    
}
