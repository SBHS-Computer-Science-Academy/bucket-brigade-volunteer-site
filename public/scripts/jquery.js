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
		var mID = $(this).attr("id");
		var ID = '#' + mID;
		var txt = "<input type='hidden' id=" + mID + " name='denied' value=" + mID + ">";
		if (selectingImages == true)
		{
			if ($(this).hasClass("selected"))
			{
				$('#elems').append(txt);
				$(this).removeClass("selected");
				$(this).css("opacity", "0.75");
			}
			else
			{
				$('input').remove(ID);
				$(this).addClass("selected");
				$(this).css("opacity", "1.0");
			}
		}
	});
});