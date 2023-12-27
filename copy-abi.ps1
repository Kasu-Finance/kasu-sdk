$kasuRoot = "..\kasu-contracts"
$abiDir = "abis"
$kasuContractsOut = "..\kasu-contracts\out\"
$kasuContractsInterfaces = "..\kasu-contracts\src\core\interfaces", "..\kasu-contracts\src\locking\interfaces"

# ls $kasuContractsOut -Filter "*.abi.json" -Recurse
$interfaceFiles = @()
foreach ($interfaceDir in $kasuContractsInterfaces) {
    $data = ls $interfaceDir
   
    foreach ($file in $data) {        
        $f = [IO.Path]::Combine($kasuContractsOut, $file.Name, $file.BaseName+".abi.json")
        cp $f -Destination $abiDir 
    }
}
