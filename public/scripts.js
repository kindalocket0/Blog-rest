$('.post-delete-button').on('click', () => {
  $('.post-delete')
    .modal({
      onDeny: () => true
    }).modal('show');
})

$('.comment-delete-button').on('click', () => {
  $('.comment-delete')
    .modal({
      onDeny: () => true
    }).modal('show');
})