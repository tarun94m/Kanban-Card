class KanbanBoard {
    constructor() {
       this.toolboxContainer = document.querySelector('.toolbox-cont');
       this.modal = document.querySelector('.modal-overlay');
       this.closeBtn = document.querySelector('.modal-close-btn');
       this.textArea = document.querySelector('.modal-textarea');
       this.addCardBtn = document.querySelector('.add-card');
       this.mainCont = document.querySelector('.main-cont');
       this.allPriorityColorElems = document.querySelectorAll('.priority-color');
       this.removeBtn = document.querySelector('.remove-btn');

       this.todo = document.getElementById('todo');

       this.addModal = true;
       this.modalPriorityColor = 'red';
       this.taskArr = [];
       this.removeFlag = false;
       this.status = 'todo',

       this.bindEvents();
       this.loadTicketsfromLocalStorage();
    }

    bindEvents() {
        this.toolboxContainer.addEventListener('click', this.handleTooboxClick.bind(this));
        this.closeBtn.addEventListener('click', this.closeModal.bind(this));
        this.addCardBtn.addEventListener('click', this.handleAddCardClick.bind(this));
        console.log(this.allPriorityColorElems);

        for(const priorityColorElem of this.allPriorityColorElems){// bind(this, ar1, arg2,..., argN)
            priorityColorElem.addEventListener('click', this.handlePriorityColorClick.bind(this, priorityColorElem));
        }

        this.mainCont.addEventListener('dragstart', this.handleTicketDragStart.bind(this));
        this.mainCont.addEventListener('dragover', this.handleTicketDragOver.bind(this));
        this.mainCont.addEventListener('dragend', this.handleTicketDragEnd.bind(this)); 
        this.mainCont.addEventListener('drop', this.handleTicketDrop.bind(this));  
    }

    handleTooboxClick(event){
       const targetClassList = event.target.classList;

       if(targetClassList.contains('fa-plus')) {
         this.toggleModal();
       } else if (targetClassList.contains('color')){
          this.filterTicketByColor(targetClassList[1]);
       }else if(targetClassList.contains('fa-trash')){
          this.toggleRemoveFlag();
       }
    }

    toggleModal() {
        this.modal.style.display = this.addModal ? 'flex' : 'none';
        this.addModal = !this.addModal;
    }

    closeModal() {
      //console.log(this);
      this.toggleModal();
    }

    handleAddCardClick() {
        const task = this.textArea.value.trim();

        if(task.length){
            this.createTicket(task);
        }
    }

    createTicket(task) {
        const id = new ShortUniqueId().randomUUID();
        const ticketCont = this.createTicketElement(task, id, this.modalPriorityColor);
        this.todo.appendChild(ticketCont);
        this.toggleModal();
        this.textArea.value = '';
        ticketCont.draggable = true;
        this.taskArr.push({id, task, color:this.modalPriorityColor, status: this.status});
        //console.log(this.taskArr);
        this.updateLocalStorage();
        console.log(ticketCont);
        this.handleLockUnlock(ticketCont, id);
        this.handleDeleteTickets(ticketCont, id);
    }

    createTicketElement(task, id, priorityColor){
        const ticketCont = document.createElement('div');
        ticketCont.className = 'ticket-cont';

        ticketCont.innerHTML = `
            <div class="ticket-color ${priorityColor}"></div>
            <div class="ticket-id">${id}</div>
            <div class="ticket-task">${task}</div>
            <div class="lock-unlock">
                <i class="fa-solid fa-lock"></i>
            </div>
        `
        return ticketCont;
    }

    updateLocalStorage(){
        const strArr = JSON.stringify(this.taskArr);
        localStorage.setItem('tickets',strArr);
    }

    loadTicketsfromLocalStorage() {
        // console.log('getting data');
        const storedTickets = localStorage.getItem('tickets');
        if(storedTickets && storedTickets.length) {
            this.taskArr = JSON.parse(storedTickets);
            this.renderStoredTickets();
        }
    }

    renderStoredTickets() {
        for(const ticket of this.taskArr){
            this.appendTicketElement(ticket.task, ticket.id, ticket.color, ticket.status);
        }
    }

    appendTicketElement(task, id, color, status) {
        const ticketElem = this.createTicketElement(task, id, color);
        ticketElem.id = id;
        console.log(ticketElem);
        ticketElem.draggable = true;
        console.log(ticketElem);
        this.handleLockUnlock(ticketElem, id);
        this.handleDeleteTickets(ticketElem, id);

        if(status === 'todo') {
            this.todo.appendChild(ticketElem);
        } else if(status === 'inprogress') {

            const inProgressCont =  document.getElementById('inprogress');
            inProgressCont.appendChild(ticketElem);

        } else if(status=== 'completed') {
            const completedCont = document.getElementById('completed');
            completedCont.appendChild(ticketElem);
        }
    }


    handlePriorityColorClick(priorityColorElem){
        console.log(priorityColorElem);
        this.decativateAllPriorityColors();
        this.activatePriorityColor(priorityColorElem);
        console.log(priorityColorElem.classList);
        this.modalPriorityColor = priorityColorElem.classList[1];
    }

    decativateAllPriorityColors() {
        for (const priorityColorElem of this.allPriorityColorElems) {
            priorityColorElem.classList.remove('active');
        }
    }

    activatePriorityColor(priorityColorElem) {
      priorityColorElem.classList.add('active');
    }

    // locking and unlocking the content -> make the content editable

    handleLockUnlock(ticketCont, id) {
        const lockUnlockBtn = ticketCont.querySelector('.lock-unlock i');
        console.log(lockUnlockBtn);
        const ticketTask = ticketCont.querySelector('.ticket-task');

        lockUnlockBtn.addEventListener('click', () => {

            lockUnlockBtn.classList.toggle('fa-lock');
            lockUnlockBtn.classList.toggle('fa-unlock');

            const contentEditable = lockUnlockBtn.classList.contains('fa-unlock');
            console.log(contentEditable);

            ticketTask.contentEditable = contentEditable;

            const idx = this.taskArr.findIndex((obj)=> obj.id === id);
            console.log(idx);

            this.taskArr[idx].task = ticketTask.innerText;

            this.updateLocalStorage();
        });
    }

    //handle the priority color change of the tickets - Home work.

    // filtering and grouping the tickets based on colors or priority
    filterTicketByColor(selectedColor) {
        console.log(selectedColor);
        const allTicketColors = document.querySelectorAll('.ticket-color');

        for(const ticketColor of allTicketColors) {
            const currentTicketColor = ticketColor.classList[1];
            const displayStyle = currentTicketColor === selectedColor ? 'block' : 'none';
            ticketColor.parentElement.style.display = displayStyle;
        }
    }

    // deleting the tickets
    toggleRemoveFlag(){
       this.removeFlag = !this.removeFlag;
       this.removeBtn.style.color = this.removeFlag ? 'red' : 'black';
    }

    handleDeleteTickets(ticketCont, id){
        ticketCont.addEventListener('click', ()=>{
            if(this.removeFlag) {
                ticketCont.remove();
                const idx = this.taskArr.findIndex((obj)=>obj.id === id);
                this.taskArr.splice(idx,1);
                this.updateLocalStorage();
            }
        })
    }

    handleTicketDragStart(event) {
      console.log(event.dataTransfer);
      event.dataTransfer.setData("text/plain", event.target.id);
      event.target.classList.add('dragging');
    }

    handleTicketDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    handleTicketDragOver(event) {
        event.preventDefault();
    }

    handleTicketDrop(event) {
        event.preventDefault();
        // console.log(event.dataTransfer.getData("text/plain"));
        const ticketId = event.dataTransfer.getData("text/plain");
        console.log(ticketId);
        const droppedTicket = document.getElementById(ticketId);
        console.log(droppedTicket);

        if(droppedTicket){
            const targetContainer = event.target.closest('.ticket-container');
            if(targetContainer) {
                const newStatus = targetContainer.id;
                
                // have to remove the ticket container from source container
                const sourceContainer = droppedTicket.closest('.ticket-container');
                console.log(sourceContainer);
                sourceContainer.removeChild(droppedTicket);

                // and append the ticket container in the source container
                targetContainer.appendChild(droppedTicket);

                // Update the status of the ticket
                const idx = this.taskArr.findIndex((obj) => obj.id === ticketId);
                if (idx !== -1) {
                    this.taskArr[idx].status = newStatus;
                    this.updateLocalStorage(); // Update local storage with the new status
                }
            }
        }
    }
}

new KanbanBoard();