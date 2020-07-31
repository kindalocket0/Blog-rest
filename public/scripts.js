$('button').on('click', () => {
  $('.ui.modal')
  .modal({
   onDeny: () => true 
  }).modal('show')
;
})