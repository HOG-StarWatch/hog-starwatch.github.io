# 自动补全

运行对应的命令以在所有会话中启用 Shell 自动补全：

::: code-group

```bash [bash]
echo "source <(tdl completion bash)" >> ~/.bashrc
```

```zsh [zsh]
echo "source <(tdl completion zsh)" >> ~/.zshrc
```

```fish [fish]
echo "tdl completion fish | source" >> ~/.config/fish/config.fish
```

```powershell [PowerShell]
Add-Content -Path $PROFILE -Value "tdl completion powershell | Out-String | Invoke-Expression"
```

:::
