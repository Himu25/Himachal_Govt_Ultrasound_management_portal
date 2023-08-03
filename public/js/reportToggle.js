function handleSelection() {
    var type = document.getElementById("data-option").value;
    var typeSelect = document.getElementById('data-option');
    var block1 = document.getElementById('block_1');
    var block2 = document.getElementById('block_2');
    var block3 = document.getElementById('block_3');
    var DistrictSelect = document.getElementById('districtSelect');
    var BlockSelect= document.getElementById('blockSelect');
    var Ucid = document.getElementById('iid');
    if (type === "all-in-district") {
        block1.style.display = "block";
        block2.style.display = "none";
        block3.style.display = "none";
        DistrictSelect.disabled = false;
        BlockSelect.disabled = true;
        Ucid.disabled = true;
        DistrictSelect.required = true;
        BlockSelect.required = false;
        Ucid.required = false;
    } else if (type === "all-in-block") {
        block1.style.display = "block";
        block2.style.display = "block";
        block3.style.display = "none";
        DistrictSelect.disabled = false;
        BlockSelect.disabled = false;
        Ucid.disabled = true;
        DistrictSelect.required = true;
        BlockSelect.required = true;
        Ucid.required = false;
    } else if (type === "single") {
        block1.style.display = "none";
        block2.style.display = "none";
        block3.style.display = "block";
        DistrictSelect.disabled = true;
        BlockSelect.disabled = true;
        Ucid.disabled = false;
        DistrictSelect.required = false;
        BlockSelect.required = false;
        Ucid.required = true;
    }
    }
    
    document.getElementById("data-option").addEventListener("change", handleSelection);
    
    handleSelection();