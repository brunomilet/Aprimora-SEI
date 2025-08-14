Get-ChildItem -Directory | ForEach-Object {
    $nomeOriginal = $_.Name
    $caminhoOriginal = $_.FullName

    if ($nomeOriginal -match '^(.*?)(-)?\s*(\d{5})$') {
        $nomeSemNumero = $matches[1].Trim()
        $numero = $matches[3]
        $novoNome = "$nomeSemNumero - $numero"

        if ($nomeOriginal -ne $novoNome) {
            $novoCaminho = Join-Path $_.Parent.FullName $novoNome
            Rename-Item -Path $caminhoOriginal -NewName $novoNome
        }
    }
}
