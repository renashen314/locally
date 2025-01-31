defmodule Search.Meilisearch do
  def search(query) do
    meili_host = Application.get_env(:search, :meilisearch)[:host]

    case Req.get!("#{meili_host}/indexes/movies/search", params: %{q: query}) do
      %{status: 200, body: body} ->
        {:ok, body}

      %{status: status, body: body} ->
        {:ok, {status, body}}

      {:error, error} ->
        error
    end
  end
end
