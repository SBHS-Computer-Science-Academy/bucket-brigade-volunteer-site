$(document).ready(function() 
{
	var selected = false;
	var selectingImages = false;
	
	$(".select-img").click(function() 
	{
		if (selectingImages == true)
		{
			selectingImages = false;
			$(".grid-item").css("opacity", "1.0");
			if ($(".grid-item").hasClass("selected"))
			{
				$(".grid-item").removeClass("selected");
			}
		}
		else
		{
			selectingImages = true;
			$(".grid-item").css("opacity", "0.75");
		}
	});
	
	$(".grid-item").click(function() 
	{
		//$(this).css("opacity", "0.75");
		if (selectingImages == true)
		{
			if ($(this).hasClass("selected"))
			{
				$(this).removeClass("selected");
				$(this).css("opacity", "0.75");
			}
			else
			{
				$(this).addClass("selected");
				$(this).css("opacity", "1.0");
			}
		}
	});
	
});