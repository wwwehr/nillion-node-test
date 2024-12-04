{
  description = "Development environment for Nillion & Node.js 23";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    nixpkgs.inputs.from = { url = "github:NixOS/nixpkgs/nixos-unstable"; };
  };

  outputs = { self, nixpkgs }:
    let
      pkgs = import nixpkgs {
        system = "x86_64-linux"; # Adjust to your architecture
      };
    in
    {
      devShell = pkgs.mkShell {
        name = "node23-dev-env";
        buildInputs = [
          pkgs.nodejs-23_x
          pkgs.yarn
          pkgs.git
          pkgs.npm
        ];

        shellHook = ''
          echo "Welcome to Nillion node environment!"
          echo "Node.js version: $(node -v)"
        '';
      };
    };
}

