# Lista que irá acumular todos os dados
$listaDados = @()

Get-ChildItem -Directory | ForEach-Object {
    $pasta = $_.FullName
    $nomePasta = $_.Name

    # Pega todos os arquivos PDF dentro da pasta (recursivamente)
    $arquivos = Get-ChildItem -Path $pasta -Recurse -File -Filter *.pdf | Sort-Object Name

    # Extrai o nome (parte antes do hífen)
    $nome = ($nomePasta -split '-')[0].Trim()

    # Cria os objetos de dados e adiciona à lista
    $listaDados += $arquivos | ForEach-Object {
        [PSCustomObject]@{
            nome    = $nome
            pasta   = $nomePasta
            arquivo = $_.Name
            Data    = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
}

    # Caminho do CSV dentro da própria pasta
    #$csvPath = Join-Path $pasta "$nomePasta.csv"

    # Caminho do CSV final na raiz
    $csvFinal = ".\Consolidado.csv"

    # Exporta com separador ";" no padrão brasileiro
    $listaDados | Export-Csv -Path $csvFinal -Encoding UTF8 -Delimiter ";" -NoTypeInformation

    # Remove aspas e mantém acentuação com UTF8
    $conteudo = Get-Content $csvFinal
    $conteudoSemAspas = $conteudo | ForEach-Object { $_ -replace '"', '' }
    $conteudoSemAspas | Set-Content -Encoding UTF8 -Path $csvFinal


    # # Cabeçalho
    # "nome;pasta;arquivo;Data" | Set-Content -Encoding UTF8 $csvPath

    # # Adiciona uma linha por arquivo
    # foreach ($arquivo in $arquivos) {
    #     $dataModificacao = $arquivo.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    #     $linha = "$nome;$nomePasta;$($arquivo.Name);$dataModificacao"
    #     Add-Content -Encoding UTF8 -Path $csvPath -Value $linha
    # }
