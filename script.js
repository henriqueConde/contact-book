// TENTAR USAR O MEMOIZATION - CACHEABLE NO CAPITULO 3 DO LIVRO
const INITIAL_STATE = {
    contacts: [],
}
let state = INITIAL_STATE;
const MAIN = document.querySelector('#main');

const getLocalStorageState = () => JSON.parse(localStorage.getItem('state'));
const setLocalStorageState = newState => localStorage.setItem('state', JSON.stringify(newState));

const createEl = (tag, attributes = {}, events = {}) => {
    const el = document.createElement(tag);

    Object.entries(attributes).forEach(([attr, value]) => {
        el[attr] = value;
    })

    Object.entries(events).forEach(([eventType, func]) => {
        el.addEventListener(eventType, func);
    });

    return el;
}


// Check if localStorage has state
const checkLocalStorage = () => {
    if(!getLocalStorageState()) {
        setLocalStorageState(INITIAL_STATE);
    } else {
        state = {
            ...state, 
            ...getLocalStorageState(),
        }
    }
}

const renderAddContactModal = () => {
    const addBtn = document.querySelector('.footer__add-button');
    addBtn.addEventListener('click', () => {
        createAddContactModal();
    })
}

const createAddContactForm = () => {
    const formFields = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            className: 'form__name'
        },
        {
            name: 'surname',
            label: 'Surname',
            type: 'text',
            className: 'form__surname'
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            className: 'form__email'
        },
        {
            name: 'phone-number',
            label: 'Phone Number',
            type: 'tel',
            className: 'form__phone-number'
        },
    ];

    const addContactForm = createEl('form', {
        className: 'form'
    });

    formFields.forEach(field => {
        const formGroup = createEl('div', {
            className: 'form__group',
        });

        const input = createEl('input', {
            className: `form__input ${field.className}`,
            name: field.name,
            id: field.name,
            type: field.type
        });

        const label = createEl('label', {
            textContent: field.label,
            className: 'form__label',
            htmlFor: field.name
        })

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        addContactForm.appendChild(formGroup);
    })

    const addContactButton = createEl('button', {
        textContent: 'Add Contact',
        className: 'form__add-button'
    })

    addContactForm.appendChild(addContactButton);
    return addContactForm;
}

const createAddContactModal = () => {
    const modalContainer = createEl('div', {
        className: 'modal-container'
    })

    const modal = createEl('div', {
        className: 'modal'
    })

    modalContainer.appendChild(modal);
    document.querySelector('#app').appendChild(modalContainer);
    modal.appendChild(createAddContactForm());
}


const INIT = () => {
    checkLocalStorage();
    renderAddContactModal();
}

INIT();

console.log(state);