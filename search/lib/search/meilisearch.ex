defmodule Search.Meilisearch do
  def search(query) do
    meili_host = config(:host)

    case Req.get!("#{meili_host}/indexes/movies/search", params: %{q: query}) do
      %{status: 200, body: body} ->
        {:ok, body}

      %{status: status, body: body} ->
        {:ok, {status, body}}

      {:error, error} ->
        error
    end
  end

  def load_more(query, offset) do
    meili_host = config(:host)

    case Req.get!("#{meili_host}/indexes/movies/search", params: %{q: query, offset: offset}) do
      %{status: 200, body: body} ->
        {:ok, body}

      %{status: status, body: body} ->
        {:ok, {status, body}}

      {:error, error} ->
        error
    end
  end

  defp config(key) do
    Application.get_env(:search, :meilisearch)[key]
  end
end
