

function fileValidation() 
{
	var fileInput = document.getElementById('media');
	var filePath = fileInput.value;

	// Allowing file type
	var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.mov|\.mp4|\.webm)$/i;
	if (filePath!="" && !allowedExtensions.exec(filePath)) 
	{
	alert('Invalid file type');
	fileInput.value = '';
	return false;
	} 
	else 
	{
	return true;
	}
}