// TENTAR USAR O MEMOIZATION - CACHEABLE NO CAPITULO 3 DO LIVRO
const INITIAL_STATE = {
    contacts: [],
}
let state = INITIAL_STATE;
const MAIN = document.querySelector('#main');

const FORM_FIELDS = [
    {
        name: 'name',
        label: 'Name',
        type: 'text',
        className: 'form__name',
        validations: {
            isRequired: true,
            regexVal: /^[a-z ,.'-]+$/i,
            minLength: 2,
            maxLength: 20,
        }
    },
    {
        name: 'surname',
        label: 'Surname',
        type: 'text',
        className: 'form__surname',
        validations: {
            isRequired: true,
            regexVal: /^[a-z ,.'-]+$/i,
            minLength: 2,
            maxLength: 20,
        }
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        className: 'form__email',
        validations: {
            isRequired: true,
            regexVal: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i,
        }
    },
    {
        name: 'phone-number',
        label: 'Phone Number',
        type: 'tel',
        className: 'form__phone-number',
        validations: {
            isRequired: false,
            regexVal: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{3})(?: *x(\d+))?\s*$/i,
        }
    },
];

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

const validateForm = () => {
    const formInputs = [...document.querySelectorAll('.form__input')];
    const errorMessages = {};
    formInputs.forEach(input => {
        const { validations } = FORM_FIELDS.filter(field => field.name === input.name)[0];

        if(!validations.isRequired && input.value === '') {
            return;
        }
        
        if(validations.minLength !== null && input.value.length < validations.minLength) {
            errorMessages[input.name] = `The ${input.name} is to short`;
            return;
        }

        if(validations.maxLength !== null && input.value.length > validations.maxLength) {
            errorMessages[input.name] = `The ${input.name} is to long`;
            return;
        }

        if(!validations.regexVal.test(input.value)) {
            errorMessages[input.name] = `The ${input.name} is not valid`;
            return;
        }

    })

    return errorMessages;
}

const renderErrorMessages = errorMessages => {
    removeErrorMessages();
    Object.keys(errorMessages).forEach(key => {
        const errorInput = document.querySelector(`#${key}`).parentNode;
        const message = createEl('span', {
            textContent: errorMessages[key],
            className: 'form__error-message'
        })
        errorInput.appendChild(message);
    })
}

const removeErrorMessages = () => {
    const errorMessages = [...document.querySelectorAll('.form__error-message')];
    errorMessages.forEach(message => message.remove());
}

const createAddContactForm = () => {
    const addContactForm = createEl('form', {
        className: 'form'
    });

    FORM_FIELDS.forEach(field => {
        const formGroup = createEl('div', {
            className: 'form__group',
        });

        const divInput = createEl('div', {
            className:'input-div',
        });

        const input = createEl('input', {
            className: `form__input ${field.className}`,
            name: field.name,
            id: field.name,
            type: field.type
        }, {
            focus: removeErrorMessages,
        });

        const label = createEl('label', {
            textContent: field.label,
            className: 'form__label',
            htmlFor: field.name
        })

        divInput.appendChild(input)
        formGroup.appendChild(label);
        formGroup.appendChild(divInput);
        addContactForm.appendChild(formGroup);
    })

    const addContactButton = createEl('button', {
        textContent: 'Add Contact',
        className: 'form__add-button'
    }, {
        click: function(event) {
            event.preventDefault();
            const errorMessages = validateForm();
            if (errorMessages.length === 0) {
                // updateState();
                // removeModal();
            } else {
                renderErrorMessages(errorMessages);
            }
        }
    })

    addContactForm.appendChild(addContactButton);
    return addContactForm;
}

const removeModal = () => {
    document.querySelector('.modal-container').remove();
}

const createAddContactModal = () => {
    const modalContainer = createEl('div', {
        className: 'modal-container'
    }, {
        click: function ({ target }) {
            if(target.classList.contains('modal-container')) {
                return removeModal()
            }
        },
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